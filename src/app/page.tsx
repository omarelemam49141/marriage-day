"use client";

import { Header } from "@/components/layout/Header";
import { HeroCountdown } from "@/components/sections/HeroCountdown";
import { AttendanceChoice } from "@/components/sections/AttendanceChoice";
// import { BrideGroom } from "@/components/sections/BrideGroom";
// import { FunnyBeforeAfter } from "@/components/sections/FunnyBeforeAfter";
// import { FunnyFacts } from "@/components/sections/FunnyFacts";
// import { CoupleMessages } from "@/components/sections/CoupleMessages";
// import { HalalGames } from "@/components/sections/HalalGames";
// import { FooterBlessing } from "@/components/sections/FooterBlessing";

export default function Home() {
  return (
    <main className="min-h-screen selection:bg-primary/20">
      <Header />
      <HeroCountdown />
      <AttendanceChoice />
      {/* <BrideGroom /> */}
      {/* <FunnyBeforeAfter /> */}
      {/* <FunnyFacts /> */}
      {/* <CoupleMessages /> */}
      {/* <HalalGames /> */}
      {/* <FooterBlessing /> */}
    </main>
  );
}
