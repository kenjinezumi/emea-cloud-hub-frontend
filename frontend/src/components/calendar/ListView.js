import React, { useContext, useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { List, ListItem, ListItemText, Typography, Paper } from '@mui/material';
import { useLocation } from 'react-router-dom';
import GlobalContext from '../../context/GlobalContext';
import { getEventData } from '../../api/getEventData';
import EventInfoPopup from '../popup/EventInfoModal';

export default function ListView() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const {
    filters,
    setShowEventModal,
    setShowInfoEventModal,
    searchText,
    showEventInfoModal,
    setSelectedEvent,
  } = useContext(GlobalContext);
  const location = useLocation(); // useLocation hook

  // Fetch events whenever the location changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventData = await getEventData('eventDataQuery');
        setEvents(eventData);
      } catch (error) {
        console.error('Error fetching event data:', error);
      }
    };

    fetchData();
    setShowEventModal(false);
    setShowInfoEventModal(false);
  }, [location, setShowEventModal, setShowInfoEventModal]);

  // Apply filters to events
  // useEffect(() => {
  //   const fetchAndFilterEvents = async () => {
  //     try {
  //       const eventData = await getEventData('eventDataQuery');
  //       setEvents(eventData);
  
  //       if (!Array.isArray(eventData)) {
  //         console.error("fetchAndFilterEvents was called with 'eventData' that is not an array:", eventData);
  //         return;
  //       }
  
  //       const results = await Promise.all(eventData.map(async (event) => {
  //         try {
  //           const subRegionMatch = filters.subRegions.some(subRegion => {
  //             try {
  //               return subRegion.checked && event.subRegion?.includes(subRegion.label);
  //             } catch (err) {
  //               console.error('Error checking subRegion filter:', err, subRegion, event);
  //               return false;
  //             }
  //           });
  
  //           const gepMatch = filters.gep.some(gep => {
  //             try {
  //               return gep.checked && event.gep?.includes(gep.label);
  //             } catch (err) {
  //               console.error('Error checking GEP filter:', err, gep, event);
  //               return false;
  //             }
  //           });
  
  //           const buyerSegmentRollupMatch = filters.buyerSegmentRollup.some(segment => {
  //             try {
  //               return segment.checked && event.buyerSegmentRollup?.includes(segment.label);
  //             } catch (err) {
  //               console.error('Error checking buyerSegmentRollup filter:', err, segment, event);
  //               return false;
  //             }
  //           });
  
  //           const accountSectorMatch = filters.accountSectors.some(sector => {
  //             try {
  //               return sector.checked && event.accountSectors?.[sector.label];
  //             } catch (err) {
  //               console.error('Error checking accountSectors filter:', err, sector, event);
  //               return false;
  //             }
  //           });
  
  //           const accountSegmentMatch = filters.accountSegments.some(segment => {
  //             try {
  //               return segment.checked && event.accountSegments?.[segment.label]?.selected;
  //             } catch (err) {
  //               console.error('Error checking accountSegments filter:', err, segment, event);
  //               return false;
  //             }
  //           });
  
  //           const productFamilyMatch = filters.productFamily.some(product => {
  //             try {
  //               return product.checked && event.productAlignment?.[product.label]?.selected;
  //             } catch (err) {
  //               console.error('Error checking productFamily filter:', err, product, event);
  //               return false;
  //             }
  //           });
  
  //           const industryMatch = filters.industry.some(industry => {
  //             try {
  //               return industry.checked && event.industry === industry.label;
  //             } catch (err) {
  //               console.error('Error checking industry filter:', err, industry, event);
  //               return false;
  //             }
  //           });
  
  //           const isPartneredEventMatch = filters.isPartneredEvent === event.isPartneredEvent;
  //           const isDraftMatch = filters.isDraft === event.isDraft;

  
  //           return (
  //             subRegionMatch &&
  //             gepMatch &&
  //             buyerSegmentRollupMatch &&
  //             accountSectorMatch &&
  //             accountSegmentMatch &&
  //             productFamilyMatch &&
  //             industryMatch &&
  //             isPartneredEventMatch &&
  //             isDraftMatch
  //           );
  //         } catch (filterError) {
  //           console.error('Error applying filters to event:', filterError, event);
  //           return false;
  //         }
  //       }));
  
  //       setFilteredEvents(eventData.filter((_, index) => results[index]));
  //     } catch (error) {
  //       console.error('Error fetching event data:', error);
  //     }
  //   };
  
  //   fetchAndFilterEvents();
  // }, [location, filters]);

  // Filter events based on search text
// Filter events based on search text and sort by date in descending order
useEffect(() => {
  if (searchText) {
    const lowercasedSearchText = searchText.toLowerCase();
    const filtered = events.filter(event => {
      const title = event.title || ''; // Default to an empty string if null/undefined
      const description = event.description || ''; // Default to an empty string if null/undefined
      return (
        title.toLowerCase().includes(lowercasedSearchText) ||
        description.toLowerCase().includes(lowercasedSearchText)
      );
    });
    setFilteredEvents(
      filtered.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    );
  } else {
    setFilteredEvents(
      events.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    );
  }
}, [searchText, events]);


  // Memoized function to handle event click
  const handleEventClick = useCallback((eventData) => {
    setSelectedEvent(eventData);
    setShowInfoEventModal(true);
  }, [setSelectedEvent, setShowInfoEventModal]);

  // Helper function to determine the border color based on the event type
  const getBorderColor = (eventType) => {
    switch (eventType) {
      case 'Online Event':
        return '#4285F4'; // Blue
      case 'Physical Event':
        return '#DB4437'; // Red
      case 'Hybrid Event':
        return '#0F9D58'; // Green
      case 'Customer Story':
        return '#F4B400'; // Yellow
      case 'Blog Post':
        return '#AB47BC'; // Purple
      default:
        return '#e3f2fd'; // Default Light Blue
    }
  };

  return (
    <Paper sx={{ margin: 2, padding: 2, width: '90%', overflowY: 'auto' }}>
      <List>
        {filteredEvents.map((event, index) => {
          const borderColor = getBorderColor(event.eventType);

          return (
            <ListItem
              key={index}
              divider
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                cursor: 'pointer',
                margin: '4px 0',
                padding: '10px',
                borderLeft: `8px solid ${borderColor}`, // Apply the dynamic border color
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'background-color 0.2s, box-shadow 0.2s',
              }}
              onClick={() => handleEventClick(event)}
            >
              <ListItemText
                primary={<Typography variant="h6">{event.title} {event.emoji}</Typography>}
                secondary={`Start date: ${dayjs(event.startDate).format('dddd, MMMM D, YYYY')}\nCountries: ${event.country?.join(', ')}`}
              />
            </ListItem>
          );
        })}
      </List>
      {showEventInfoModal && <EventInfoPopup />}
    </Paper>
  );
}
