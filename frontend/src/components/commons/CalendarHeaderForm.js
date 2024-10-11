import React, { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LinkIcon from '@mui/icons-material/Link';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete'; 
import ExitToAppIcon from '@mui/icons-material/ExitToApp'; // Import Exit Icon
import { blue } from '@mui/material/colors';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import GlobalContext from "../../context/GlobalContext";
import { sendDataDeleteToAPI } from "../../api/deleteEvent";

const NavigationSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formData, updateFormData, selectedEvent } = useContext(GlobalContext);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const navigateTo = (path, currentFormData) => {
    updateFormData({ ...formData, ...currentFormData });
    navigate(path);
  };

  const handleExitOpen = () => {
    setExitDialogOpen(true);
  };

  const handleExitClose = () => {
    setExitDialogOpen(false);
  };

  const handleDeleteOpen = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleExitConfirm = () => {
    setExitDialogOpen(false);
    window.location.href = '/';
  };

  const handleDeleteConfirm = async () => {
    setDeleteDialogOpen(false);
    
    if (selectedEvent && selectedEvent.eventId) {
      const eventId = selectedEvent.eventId; 
      console.log('The event ID to delete is: ', eventId);
      
      try {
        const response = await sendDataDeleteToAPI({
          eventId, 
        });

        if (response && response.success) {
          console.log('Event deleted successfully');
          window.location.href = '/'; // Redirect after successful deletion
        } else {
          console.error('Failed to delete the event');
        }
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    } else {
      console.error('No event selected for deletion');
    }
  };

  const isCurrentPath = (path) => location.pathname === path;

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-64px)] w-60 bg-white shadow-md p-4">
      <div className="text-lg mb-2">Sections</div>
      <button
        onClick={() => navigateTo('/create-event')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/create-event') ? 'text-black' : 'text-gray-400'}`}
      >
        <CalendarMonthIcon style={{ color: blue[500] }} />
        <span className="ml-2">About</span>
      </button>
      <button
        onClick={() => navigateTo('/location')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/location') ? 'text-black' : 'text-gray-400'}`}
      >
        <LocationOnIcon style={{ color: blue[500] }} />
        <span className="ml-2">Location</span>
      </button>
      <button
        onClick={() => navigateTo('/extra')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/extra') ? 'text-black' : 'text-gray-400'}`}
      >
        <InfoIcon style={{ color: blue[500] }} />
        <span className="ml-2">Extra details</span>
      </button>
      <button
        onClick={() => navigateTo('/email-invitation')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/email-invitation') ? 'text-black' : 'text-gray-400'}`}
      >
        <EmailIcon style={{ color: blue[500] }} />
        <span className="ml-2">Email Invitation</span>
      </button>
      {/* Move Audience button below Email Invitation */}
      <button
        onClick={() => navigateTo('/audience')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/audience') ? 'text-black' : 'text-gray-400'}`}
      >
        <PeopleIcon style={{ color: blue[500] }} />
        <span className="ml-2">Audience</span>
      </button>
      <button
        onClick={() => navigateTo('/links')}
        className={`block w-full text-left p-2 rounded flex items-center ${isCurrentPath('/links') ? 'text-black' : 'text-gray-400'}`}
      >
        <LinkIcon style={{ color: blue[500] }} />
        <span className="ml-2">Links</span>
      </button>
      <hr className="my-4" />
      <button
        onClick={handleExitOpen}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded text-red-500 flex items-center"
      >
        <ExitToAppIcon style={{ color: 'red' }} />
        <span className="ml-2">Exit</span>
      </button>
      <button
        onClick={handleDeleteOpen}
        className="block w-full text-left p-2 hover:bg-gray-200 rounded text-red-500 flex items-center"
      >
        <DeleteIcon style={{ color: 'red' }} />
        <span className="ml-2">Delete</span>
      </button>

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={exitDialogOpen}
        onClose={handleExitClose}
        aria-labelledby="exit-dialog-title"
        aria-describedby="exit-dialog-description"
      >
        <DialogTitle id="exit-dialog-title">
          {"Confirm Exit"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="exit-dialog-description">
            Are you sure you want to leave this page? All unsaved data will be lost. 
            <br/><br/>
            Clicking on the Next button save the current form.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExitClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleExitConfirm} color="primary" autoFocus>
            Exit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          {"Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NavigationSidebar;
