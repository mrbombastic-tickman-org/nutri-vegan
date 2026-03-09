import { NextRequest, NextResponse } from 'next/server';

interface SearchResult {
    title: string;
    snippet: string;
    url: string;
}

interface DuckDuckGoResponse {
    Abstract?: string;
    AbstractText?: string;
    AbstractSource?: string;
    AbstractURL?: string;
    Image?: string;
    Heading?: string;
    Answer?: string;
    AnswerType?: string;
    RelatedTopics?: Array<{
        Text?: string;
        FirstURL?: string;
        Result?: string;
    }>;
}

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
        }

        // Use DuckDuckGo Instant Answer API (completely free, no API key)
        const searchQuery = encodeURIComponent(query);
        const ddgUrl = `https://api.duckduckgo.com/?q=${searchQuery}&format=json&no_html=1&skip_disambig=1`;

        const response = await fetch(ddgUrl, {
            headers: {
                'User-Agent': 'NutriVegan/1.0',
            },
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data: DuckDuckGoResponse = await response.json();
        const results: SearchResult[] = [];

        // Add main abstract if available
        if (data.AbstractText) {
            results.push({
                title: data.Heading || 'Information',
                snippet: data.AbstractText,
                url: data.AbstractURL || '',
            });
        }

        // Add answer if available
        if (data.Answer) {
            results.push({
                title: 'Quick Answer',
                snippet: data.Answer,
                url: '',
            });
        }

        // Add related topics
        if (data.RelatedTopics) {
            for (const topic of data.RelatedTopics.slice(0, 5)) {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0] || 'Related',
                        snippet: topic.Text,
                        url: topic.FirstURL,
                    });
                }
            }
        }

        // Create a summary for the AI
        let searchSummary = '';
        if (results.length > 0) {
            searchSummary = results.map(r => `• ${r.snippet}`).join('\n').slice(0, 2000);
        }

        return NextResponse.json({
            success: true,
            results: results.slice(0, 5),
            summary: searchSummary,
            query: query,
        });

    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Search failed', success: false },
            { status: 500 }
        );
    }
}

// GET endpoint to test search
export async function GET(req: NextRequest) {
    const query = req.nextUrl.searchParams.get('q');

    if (!query) {
        return NextResponse.json({
            message: 'Web Search API (Free - DuckDuckGo)',
            usage: 'POST with {"query": "your search"} or GET with ?q=query'
        });
    }

    // Redirect to POST handler
    const response = await POST(new NextRequest(req.url, {
        method: 'POST',
        body: JSON.stringify({ query }),
    }));

    return response;
}
