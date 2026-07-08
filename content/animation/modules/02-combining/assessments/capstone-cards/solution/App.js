import { motion } from 'motion/react';

const grid = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const card = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const projects = [
  { id: 1, name: 'Portfolio' },
  { id: 2, name: 'Dashboard' },
  { id: 3, name: 'Storefront' },
  { id: 4, name: 'Blog' },
];

export default function ProjectGrid() {
  return (
    <motion.div variants={grid} initial="hidden" animate="visible">
      {projects.map((project) => (
        <motion.article key={project.id} variants={card}>
          <h3>{project.name}</h3>
        </motion.article>
      ))}
    </motion.div>
  );
}
