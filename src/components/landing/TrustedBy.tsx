import { Shield, Zap, Globe, Code2, Cpu, Layers } from "lucide-react";

const logos = [
  { icon: Zap, name: "FastAPI Co" },
  { icon: Globe, name: "CloudSync" },
  { icon: Code2, name: "DevForge" },
  { icon: Cpu, name: "NeuralOps" },
  { icon: Layers, name: "StackBase" },
  { icon: Shield, name: "SecureNet" },
];

const TrustedBy = () => (
  <section className="py-10 px-4 animate-on-scroll">
    <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
      Trusted by developers at
    </p>
    <div className="mx-auto max-w-3xl flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
      {logos.map((l) => (
        <div
          key={l.name}
          className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300"
        >
          <l.icon className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-tight">{l.name}</span>
        </div>
      ))}
    </div>
  </section>
);

export default TrustedBy;
