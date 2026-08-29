import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const signupPath = path.join(root, 'components/auth/SignupForm.tsx');

if (!fs.existsSync(signupPath)) {
  throw new Error('SignupForm.tsx not found');
}

let signup = fs.readFileSync(signupPath, 'utf8');

const recoveryGate = `    const keys = recoveryQuestions;\n    if (keys.some((k) => !k) || new Set(keys).size !== 3) {\n      setRecoveryDistinctError(true);\n      return;\n    }\n    setRecoveryDistinctError(false);\n`;

if (!signup.includes(recoveryGate)) {
  throw new Error('Recovery-question gate anchor not found');
}

signup = signup.replace(
  recoveryGate,
  `    const keys = recoveryQuestions;\n    // Recovery questions are optional in Persone Royale. The active casino-api\n    // authenticates by username/password and does not require these fields.\n    setRecoveryDistinctError(false);\n`,
);

fs.writeFileSync(signupPath, signup);
console.log('Auth fix applied: optional recovery questions on signup.');
