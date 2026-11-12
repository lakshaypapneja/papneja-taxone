import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { xmlPayload, tallyUrl = "http://127.0.0.1:9000" } = await req.json();

    if (!xmlPayload) {
      return NextResponse.json(
        { success: false, error: "Missing xmlPayload in request body" },
        { status: 400 }
      );
    }

    try {
      // Send raw XML POST to Tally Prime
      const tallyResponse = await fetch(tallyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml;charset=utf-8",
        },
        body: xmlPayload,
        // Short timeout for local socket
        signal: AbortSignal.timeout(6000),
      });

      const responseXml = await tallyResponse.text();

      // Parse Tally response XML for success / errors
      const createdMatch = responseXml.match(/<CREATED>(\d+)<\/CREATED>/i);
      const errorsMatch = responseXml.match(/<ERRORS>(\d+)<\/ERRORS>/i);
      const alteredMatch = responseXml.match(/<ALTERED>(\d+)<\/ALTERED>/i);
      const lineErrorMatch = responseXml.match(/<LINEERROR>(.*?)<\/LINEERROR>/i);

      const created = createdMatch ? parseInt(createdMatch[1], 10) : 0;
      const errors = errorsMatch ? parseInt(errorsMatch[1], 10) : 0;
      const altered = alteredMatch ? parseInt(alteredMatch[1], 10) : 0;
      const lineError = lineErrorMatch ? lineErrorMatch[1] : undefined;

      return NextResponse.json({
        success: errors === 0,
        created,
        errors,
        altered,
        lineError,
        rawResponse: responseXml,
        tallyUrl,
      });
    } catch (socketError: any) {
      // Local Tally not running or connection refused
      return NextResponse.json({
        success: false,
        isSocketUnavailable: true,
        error: `Could not connect to Tally Prime on ${tallyUrl}. Please ensure Tally Prime is open and XML Server is enabled on Port 9000 (F1 -> Settings -> Connectivity).`,
        details: socketError.message,
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
