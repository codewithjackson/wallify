export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new Response("Missing URL", { status: 400 });
  }

  try {
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": res.headers.get("content-type") || "image/jpeg",
      },
    });
  } catch (error) {
    console.error("Error downloading image:", error);
    return new Response("Failed to download image", { status: 500 });
  }
}