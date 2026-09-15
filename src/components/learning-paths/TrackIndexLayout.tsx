import { LockKeyhole } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { TrackCard } from "./TrackCard";

export interface TrackIndexLayoutProps {
  title: string;
  blurb?: string;
  logoSrc?: string;
  logoAlt?: string;
  icon?: any;
  iconColor?: string;
  sections?: any[];
  patterns?: any[];
  basePath: string;
}

export function TrackIndexLayout({
  title,
  blurb,
  logoSrc,
  logoAlt,
  icon: IconComponent,
  iconColor,
  sections,
  patterns,
  basePath,
}: TrackIndexLayoutProps) {
  const { isCompleted } = useProgress();

  const renderSections = sections || [{ title: "Chapters", patterns: patterns || [] }];

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          {logoSrc && (
            <div className="mx-auto mb-6 flex justify-center">
              <img
                src={logoSrc}
                alt={logoAlt || "Logo"}
                className="h-32 w-auto object-contain drop-shadow-sm lg:h-40 lg:w-auto"
              />
            </div>
          )}
          {IconComponent && (
            <div className="mx-auto mb-6 flex justify-center">
              <IconComponent
                className={`size-16 drop-shadow-sm lg:size-20 ${iconColor || ""}`}
                strokeWidth={1.5}
              />
            </div>
          )}
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">{title}</h1>
          {blurb && (
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
              {blurb}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {renderSections.map((sec, secIdx) => {
            const parts = sec.title ? sec.title.split(" — ") : [];
            const heading = parts.length === 2 ? parts[1] : sec.title || "Chapters";
            const sectionId = heading
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

            return (
              <div
                key={secIdx}
                id={sectionId}
                className="scroll-mt-24 flex flex-col lg:flex-row lg:items-start lg:gap-16"
              >
                <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                  <div className="flex items-center gap-3">
                    <div className="grid size-8 shrink-0 place-items-center rounded-full bg-[#E2E8F0] dark:bg-border text-sm font-bold text-foreground">
                      {secIdx + 1}
                    </div>
                    <h2 className="text-xl font-bold leading-snug tracking-tight text-foreground sm:text-[22px]">
                      {heading}
                    </h2>
                  </div>
                  {sec.blurb && (
                    <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                      {sec.blurb}
                    </p>
                  )}
                </div>

                <div className="flex w-full flex-col gap-4">
                  {sec.patterns?.map((t: any) => {
                    const Icon = t.lessons?.[0]?.icon || LockKeyhole;
                    const isLocked = t.locked;

                    const completedCount =
                      t.lessons?.filter((l: any) => isCompleted(l.slug)).length || 0;
                    const totalCount = t.lessons?.length || 0;

                    const toPath = t.path || `${basePath}/${t.slug}`;

                    return (
                      <TrackCard
                        key={t.slug}
                        title={t.title}
                        blurb={t.blurb}
                        icon={Icon}
                        isLocked={isLocked}
                        lessons={t.lessons}
                        completedCount={completedCount}
                        totalCount={totalCount}
                        href={toPath}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
