import { motion } from 'motion/react';

const skills = ['JSX', 'Props', 'State', 'Effects', 'Hooks'];

const list = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function SkillList() {
  // Render the skills as a staggered, animated list:
  //   - a <motion.ul> that drives the stagger (variants={list}, initial="hidden", animate="visible")
  //   - one <motion.li> per skill (variants={item}) showing the skill's name
  return <ul></ul>;
}
