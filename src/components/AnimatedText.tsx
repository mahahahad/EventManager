// components/AnimatedText.tsx
"use client";

import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming you have this

interface AnimatedTextProps {
  text?: string;
  children?: React.ReactNode; // Allow passing pre-styled JSX for block animation
  el?: React.ElementType;
  className?: string;
  staggerAmount?: number; // Stagger delay between children (lines or words)
  delay?: number;         // Initial delay for the whole animation
  once?: boolean;         // Animate only once on viewport entry
  
  // Animation mode
  animateAs?: 'block' | 'lines' | 'words'; // 'block' for the whole thing, 'lines' for \n, 'words' for space split

  // Variants for the animated children (words or lines or the block itself)
  childVariants?: Variants;
  childTransition?: Transition;
}

const defaultChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '100%', // Start from bottom
    skewY: 6,    // Initial skew
  },
  visible: {
    opacity: 1,
    y: '0%',
    skewY: 0,
  },
};

const defaultChildTransition: Transition = {
  type: "tween", // Using tween to match your HeroSection preference
  ease: "circOut",
  duration: 0.7,
};

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  children,
  el: WrapperComponent = 'div',
  className,
  staggerAmount = 0.08,
  delay = 0,
  once = true,
  animateAs = 'words', // Default to word-by-word
  childVariants = defaultChildVariants,
  childTransition = defaultChildTransition,
}) => {

  const renderContent = () => {
    if (children && animateAs === 'block') {
      // Animate children as a single block
      return (
        <motion.span
          className="inline-block" // The content itself
          variants={childVariants}
          // initial, animate, transition will be handled by parent staggering if any, or directly
        >
          {children}
        </motion.span>
      );
    }

    if (typeof text !== 'string') {
      // If not a string and not block animation of children, render as is (or error)
      return <>{text || children}</>; 
    }

    let elementsToAnimate: string[][] = [];
    if (animateAs === 'block') {
      elementsToAnimate = [[text]]; // One line, one "word" (the whole text)
    } else if (animateAs === 'lines') {
      elementsToAnimate = text.split('\n').map(line => [line.trim()]).filter(lineArray => lineArray[0].length > 0); // Each line is one item
    } else { // 'words'
      elementsToAnimate = text.split('\n').map(line => line.split(' ').filter(word => word.length > 0));
    }

    let itemCounter = 0;

    return elementsToAnimate.map((lineItems, lineIndex) => (
      // Each "line" (which could be an actual line or just a conceptual container for words)
      // needs a mask if its children are translating.
      // If animating as 'block' or 'lines', this outer span is the mask for the item.
      // If animating 'words', this span groups words of a line, and each word animates.
      <span key={`line-${lineIndex}`} className={animateAs !== 'block' ? "block" : "inline-block"}> 
        {lineItems.map((item, itemIndex) => {
          const itemDelay = delay + itemCounter * staggerAmount;
          itemCounter++;
          return (
            <motion.span
              key={`item-${lineIndex}-${itemIndex}`}
              className="inline-block" // Each animatable item (word or line)
              style={animateAs === 'words' ? { marginRight: '0.25em', whiteSpace: 'pre' } : {display: 'block'}} // block for lines/full block
              variants={childVariants}
              // initial, animate, viewport, transition handled by parent or this element directly
              // For staggered children of a motion component, parent handles initial/animate, child has variants.
              // If this component is directly animated (not part of parent stagger), it needs these:
              initial="hidden"
              animate="visible"
              viewport={{ once }}
              transition={{ ...childTransition, delay: itemDelay }}
            >
              {item}
            </motion.span>
          );
        })}
      </span>
    ));
  };

  // The main wrapper needs overflow:hidden to clip the y-translation
  // if we are animating blocks or lines that start offscreen.
  return (
    <WrapperComponent className={cn("overflow-hidden", className)}> 
      {renderContent()}
    </WrapperComponent>
  );
};

export default AnimatedText;
