const fs = require('fs');

const files = [
  'src/pages/executive/Profile.jsx',
  'src/pages/linelead/Profile.jsx',
  'src/pages/operator/Profile.jsx',
  'src/pages/supervisor/Profile.jsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Imports
  content = content.replace('import React from "react";', 'import React, { useState } from "react";');
  content = content.replace(
    'import { Button } from "../../components/common/Button";',
    'import { Button } from "../../components/common/Button";\nimport { EditProfileModal } from "../../components/common/EditProfileModal";\nimport { useApp } from "../../context/AppContext";'
  );

  // 2. Extract initial data from DOM to initialize state
  let emailMatch = content.match(/<span style={{ fontSize: "13px", color: "var\(--text-primary\)" }}>([^<]+@maintenx.internal)<\/span>/);
  let phoneMatch = content.match(/<span style={{ fontSize: "13px", color: "var\(--text-primary\)" }}>(\+1 \([0-9]{3}\) [0-9]{3}-[0-9]{4})<\/span>/);
  let plantMatch = content.match(/<span style={{ fontSize: "13px", color: "var\(--text-primary\)" }}>((?:Plant 1 — Main Processing Facility|Global Portfolio \(All Plants\)))<\/span>/);
  let shiftMatch = content.match(/<span style={{ fontSize: "13px", color: "var\(--text-primary\)" }}>((?:Corporate|Shift A|Day Shift) [^<]+)<\/span>/);

  if (!emailMatch || !phoneMatch || !plantMatch || !shiftMatch) {
    console.log("Failed to match data in " + file);
    return;
  }

  const initialDataStr = `
  const { addToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "${emailMatch[1]}",
    phone: "${phoneMatch[1]}",
    plant: "${plantMatch[1]}",
    shift: "${shiftMatch[1]}"
  });
`;

  // 3. Inject State
  content = content.replace(
    'export function Profile() {',
    'export function Profile() {' + initialDataStr
  );

  // 4. Update Edit Button
  content = content.replace(
    '<Button variant="primary" icon={Edit2}>Edit Profile</Button>',
    '<Button variant="primary" icon={Edit2} onClick={() => setIsEditing(true)}>Edit Profile</Button>'
  );

  // 5. Replace text with state
  content = content.replace(emailMatch[0], '<span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.email}</span>');
  content = content.replace(phoneMatch[0], '<span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.phone}</span>');
  content = content.replace(plantMatch[0], '<span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.plant}</span>');
  content = content.replace(shiftMatch[0], '<span style={{ fontSize: "13px", color: "var(--text-primary)" }}>{profileData.shift}</span>');

  // 6. Add Modal
  const modalJSX = `
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profileData={profileData}
        onSave={(data) => {
          setProfileData(data);
          addToast("Profile updated successfully.", "success");
        }}
      />
    </div>
  );
}`;
  
  // Replace the closing div and return
  content = content.replace(/    <\/div>\n  \);\n}$/, modalJSX);

  fs.writeFileSync(file, content);
  console.log("Successfully updated " + file);
});
