// Variants e helpers centralizados para framer-motion
export const fadeIn = (
  direction = "up",
  distance = 12,
  duration = 0.4,
  delay = 0
) => {
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const from =
    direction === "up" || direction === "left" ? distance : -distance;
  return {
    initial: { opacity: 0, [axis]: from },
    animate: {
      opacity: 1,
      [axis]: 0,
      transition: { duration, ease: [0.16, 1, 0.3, 1], delay },
    },
    exit: {
      opacity: 0,
      [axis]: from * -1,
      transition: { duration: duration * 0.75 },
    },
  };
};

// (Removidos exports não utilizados: staggerContainer, pop)
