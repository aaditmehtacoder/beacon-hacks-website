import type { Metadata } from "next";
import { Arrow, LinkButton } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { Shore, Sky } from "@/components/night-scene";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * Every URL the site does not have: the night over the bay, the
 * lighthouse still turning, and the way home.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader home={false} />

      <main id="main" tabIndex={-1} className="night relative isolate flex flex-1 flex-col overflow-hidden focus:outline-none">
        <Sky />
        <Shore id="lost" className="inset-x-0 bottom-0 h-[15rem] sm:h-[19rem] lg:h-[26rem]" />

        <div className="wrap relative flex flex-1 flex-col justify-center pt-14 pb-[16rem] sm:pt-20 sm:pb-[20rem] lg:pt-[min(4rem,6vh)] lg:pb-[min(17rem,30vh)]">
          <h1>
            <span className="rise block text-[clamp(6.5rem,min(24vw,27vh),15rem)] leading-[0.8] font-extrabold font-stretch-125% tracking-[-0.05em] text-moon">
              404
            </span>
            <span className="rise rise-2 mt-8 block text-[clamp(2rem,4.4vw,3.25rem)] leading-[0.95] font-extrabold tracking-[-0.035em]">
              Nothing out here
            </span>
          </h1>
          <p className="rise rise-2 mt-5 max-w-md text-lg leading-relaxed text-moon-2">
            This page doesn&rsquo;t exist, or it has moved.
          </p>
          <div className="rise rise-3 mt-9">
            <LinkButton href="/" size="lg" className="group">
              Back home
              <Arrow />
            </LinkButton>
          </div>
        </div>
      </main>
    </>
  );
}
