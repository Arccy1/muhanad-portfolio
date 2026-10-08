import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

type Props = {
  kicker: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({ kicker, title, description, align = "left", className }: Props) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("section-kicker", align === "center" && "justify-center")}>{kicker}</p>
      <h2 className="heading-display mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-relaxed text-zinc-400">{description}</p> : null}
    </Reveal>
  );
}
