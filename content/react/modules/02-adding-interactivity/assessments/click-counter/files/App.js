import { useState } from 'react';

export default function LikeButton() {
  // Make a like button, like on a social post.
  // 1. Track a like count in state, starting at 0 (useState).
  // 2. Render a <button> whose label shows the count, e.g. "♥ 0 likes".
  // 3. Each click adds one like.
  return <button>♥ 0 likes</button>;
}
