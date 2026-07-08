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
  // Render one animated card per project inside a staggered motion container:
  //   - a <motion.div> with variants={grid}, initial="hidden", animate="visible"
  //   - one <motion.article> per project (variants={card}) showing the name in an <h3>
  return <div></div>;
}
