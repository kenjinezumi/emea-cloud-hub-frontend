// import React from 'react';
// import { Dialog, DialogTitle, List, ListItem, ListItemText } from '@mui/material';
// import { useTheme } from '../ThemeContext';

// const ThemePopup = ({ onClose }) => {
//     const { setTheme } = useTheme();
  
//     const handleThemeSelect = (theme) => {
//       setTheme(theme);
//       onClose();
//     };

//   return (
//     <Dialog onClose={onClose} open={true}>
//       <DialogTitle>Choose a Theme</DialogTitle>
//       <List>
//         <ListItem button onClick={() => handleThemeSelect('dark')}>
//           <ListItemText primary="Dark" />
//         </ListItem>
//         <ListItem button onClick={() => handleThemeSelect('light')}>
//           <ListItemText primary="Light" />
//         </ListItem>
//         <ListItem button onClick={() => handleThemeSelect('highContrast')}>
//           <ListItemText primary="High Contrast" />
//         </ListItem>
//       </List>
//     </Dialog>
//   );
// };

// export default ThemePopup;
