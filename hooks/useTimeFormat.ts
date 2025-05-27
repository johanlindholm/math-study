import { useLocale } from 'next-intl';

export function useTimeFormat() {
  const locale = useLocale();
  
  const formatTime = (date: Date | string | number) => {
    const dateObj = new Date(date);
    
    // US format (12-hour with AM/PM)
    if (locale === 'en') {
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
    
    // Swedish/EU format (24-hour)
    return dateObj.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  
  const formatDate = (date: Date | string | number) => {
    const dateObj = new Date(date);
    
    // US format (MM/DD/YYYY)
    if (locale === 'en') {
      return dateObj.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
    }
    
    // Swedish/EU format (DD/MM/YYYY)
    return dateObj.toLocaleDateString('sv-SE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  const formatDateTime = (date: Date | string | number) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };
  
  return {
    formatTime,
    formatDate,
    formatDateTime
  };
}