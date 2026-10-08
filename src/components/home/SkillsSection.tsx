"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SkillDTO } from "@/lib/types";

function SkillBar({ skill, index }: { skill: SkillDTO; index: number }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-200">{skill.name}</span>
        <span className="font-display text-lg text-brand-400">{skill.level}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]" role="progressbar" aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100} aria-label={skill.name}>
        <motion.div
          className="relative h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-[#FF8A5C]"
          initial={reduce ? { width: `${skill.level}%` } : { width: 0 }}
          whileInView={{ width: `${skill.level}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="absolute inset-0 rounded-full bg-white/20 [mask-image:linear-gradient(90deg,transparent,black)]" />
        </motion.div>
      </div>
    </div>
  );
}

export default function SkillsSection({ skills }: { skills: SkillDTO[] }) {
  if (skills.length === 0) return null;
  const half = Math.ceil(skills.length / 2);
  const columns = [skills.slice(0, half), skills.slice(half)];

  return (
    <section className="relative py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-brand-900/25 blur-[130px]"
      />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-kicker justify-center">Expertise</p>
          <h2 className="heading-display mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
            MY <span className="text-gradient">SKILLS</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-400">
            Years in the timeline have sharpened every part of the craft — from the first cut to the final mix.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-x-14 gap-y-8 md:grid-cols-2">
          {columns.map((column, c) => (
            <div key={c} className="space-y-7">
              {column.map((skill, i) => (
                <SkillBar key={skill.id} skill={skill} index={c * half + i} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
