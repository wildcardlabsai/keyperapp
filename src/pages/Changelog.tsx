import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import PageCTA from "@/components/landing/PageCTA";
import { changelogEntries } from "@/lib/changelogData";
import { Badge } from "@/components/ui/badge";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const tagColors: Record<string, string> = {
  feature: "bg-primary/15 text-primary border-primary/20",
  fix: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  improvement: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  security: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const Changelog = () => {
  const scrollRef = useScrollAnimation();

  return (
    <div className="min-h-screen flex flex-col page-grid" ref={scrollRef}>
      <Navbar />
      <main className="flex-1 pt-28 pb-16 px-4">
        <div className="mx-auto max-w-2xl">
          <div className="animate-on-scroll">
            <h1 className="text-3xl font-bold mb-2">Changelog</h1>
            <p className="text-muted-foreground mb-12">Every update, improvement, and fix shipped to Keyper.</p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-0 w-px bg-border/50" />

            <div className="space-y-10">
              {changelogEntries.map((entry, i) => (
                <div key={i} className="relative pl-8 animate-on-scroll">
                  {/* Dot */}
                  <div className="absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 border-primary bg-background" />

                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{entry.date}</span>
                    <Badge variant="outline" className="text-xs font-mono border-border/60">{entry.version}</Badge>
                    {entry.tags.map((tag) => (
                      <span key={tag} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${tagColors[tag] || ""}`}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-lg font-semibold mb-1.5">{entry.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{entry.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <PageCTA heading="Stay up to date" description="Sign up to be the first to know about new features and improvements." />
      <Footer />
    </div>
  );
};

export default Changelog;
