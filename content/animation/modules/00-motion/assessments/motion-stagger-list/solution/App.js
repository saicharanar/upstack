import { motion } from 'motion/react';

const skills = ['JSX', 'Props', 'State', 'Effects', 'Hooks'];

const list = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } };

export default function SkillList() {
  return (
    <motion.ul variants={list} initial="hidden" animate="visible">
      {skills.map((skill) => (
        <motion.li key={skill} variants={item}>
          {skill}
        </motion.li>
      ))}
    </motion.ul>
  );
}
