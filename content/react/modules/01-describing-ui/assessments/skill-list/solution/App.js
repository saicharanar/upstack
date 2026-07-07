const skills = ['JSX', 'Props', 'Conditional rendering', 'Lists'];

export default function SkillList() {
  return (
    <ul>
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  );
}
