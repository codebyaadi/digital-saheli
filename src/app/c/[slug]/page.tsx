import { redirect } from "next/navigation";

/** Old course URLs from the prototype keep working. */
export default async function LegacyCourse({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/learn/${slug}`);
}