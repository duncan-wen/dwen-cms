import Link from "next/link";
import type { Post } from "@/content/content";
import { formatDate } from "@/format-date";
import { TagList } from "./tag-list";

type Props = {
  posts: Post[];
  /** Heading level for each Post title, one below the section it sits in. */
  titleAs: "h2" | "h3";
};

/** Posts as a list of title, date, description and Tags, in the order given. */
export function PostList({ posts, titleAs: Heading }: Props) {
  return (
    <ul className="space-y-8">
      {posts.map((post) => (
        <li key={post.slug}>
          <article>
            <Heading className="text-xl font-semibold tracking-tight">
              <Link href={`/posts/${post.slug}`} className="hover:underline">
                {post.title}
              </Link>
            </Heading>
            <time dateTime={post.date} className="mt-1 block text-sm text-zinc-500">
              {formatDate(post.date)}
            </time>
            <p className="mt-2 text-zinc-700">{post.description}</p>
            <TagList tags={post.tags} className="mt-3" />
          </article>
        </li>
      ))}
    </ul>
  );
}
