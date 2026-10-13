"use client";

import { AnimatePresence,motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({children}){
  const pathname=usePathname();
  return <AnimatePresence mode="wait" initial={false}><motion.div key={pathname} initial={{opacity:0,y:14,scale:.995,filter:"blur(3px)"}} animate={{opacity:1,y:0,scale:1,filter:"blur(0px)"}} exit={{opacity:0,y:-6,scale:.998,filter:"blur(2px)"}} transition={{duration:.36,ease:[.22,1,.36,1]}}>{children}</motion.div></AnimatePresence>;
}
