'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { SafeRemoteImage } from '@/components/shared/safe-remote-image';
import { formatDate } from '@/lib/utils/format';
import { useAuthStore } from '@/store/auth-store';
import type { PublicStory } from '@/lib/api/public.api';

interface FeaturedStoriesSectionProps {
  stories: PublicStory[];
}

export function FeaturedStoriesSection({ stories }: FeaturedStoriesSectionProps) {
  const [mounted, setMounted] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthenticated = mounted && Boolean(user);
  const rolePrefix =
    user?.role === 'SUPER_ADMIN'
      ? '/admin'
      : user?.role === 'MODERATOR'
        ? '/moderator'
        : user?.role === 'ALUMNI'
          ? '/alumni'
          : '/student';

  if (!stories || stories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="INSPIRING ALUMNI STORIES"
        title="Journeys Worth Celebrating"
        description="Real career milestones, engineering breakthroughs, and leadership lessons from North Western University graduates."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/stories" className="inline-flex items-center gap-1.5 font-bold">
              <span>View All Stories</span>
              <ArrowUpRight size={14} />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.slice(0, 3).map((story, idx) => {
          const targetUrl = isAuthenticated
            ? `${rolePrefix}/stories/${story.slug || story.id}`
            : `/login?returnTo=${encodeURIComponent(`/stories/${story.slug || story.id}`)}`;

          const fallbackCover = `https://res.cloudinary.com/a1dumxpe/image/upload/alumni-connect/stories/covers/cover_${(idx % 5) + 1}.jpg`;

          return (
            <Card
              key={story.id}
              className="flex flex-col justify-between overflow-hidden bg-white border border-slate-200/90 rounded-2xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* 16:9 Aspect Cover Image */}
                <div className="relative aspect-16/9 w-full bg-slate-900 overflow-hidden">
                  <SafeRemoteImage
                    src={story.coverImageUrl ?? undefined}
                    alt={story.title}
                    fallbackSrc={fallbackCover}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 text-[11px] font-semibold text-white/90 bg-slate-900/60 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/20">
                    {formatDate(story.publishedAt)}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                    <User size={13} className="shrink-0" />
                    <span>{story.authorName}</span>
                    {story.authorDepartment && (
                      <span className="text-slate-400">· {story.authorDepartment}</span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 m-0">
                    {story.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed m-0">
                    {story.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer with Auth-Gated Button */}
              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                  <Clock size={12} />
                  3 min read
                </span>
                <Link
                  href={targetUrl}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>{isAuthenticated ? 'Read Story' : 'Sign in to Read'}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
