import { NextResponse } from "next/server";
import { analyzeOffer } from "@/lib/ai";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Optional: Protect route
        // const { data: { user } } = await supabase.auth.getUser();
        // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { content, type } = body;

        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // TODO: If type is 'url', fetch content from URL (needs a scraper or fetcher)
        // For now we assume 'content' is the raw text or the logic handles it.

        const analysis = await analyzeOffer(content);

        return NextResponse.json({ success: true, analysis });
    } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: "Failed to analyze offer" },
            { status: 500 }
        );
    }
}
