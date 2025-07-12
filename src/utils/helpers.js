// Helper function to throttle execution of another function
export function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Helper function to debounce execution of another function
export function debounce(func, delay) {
  let timer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(context, args), delay);
  };
}

// Helper function to safely parse JSON
export function safeJSONParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return null;
  }
}

// Helper function to validate email format
export function validateEmail(email) {
  const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
}

// Helper function to get current time in HH:MM:SS format
export function getCurrentTime() {
  const now = new Date();
  return now.toTimeString().split(' ')[0];
}

// Helper function to format date to YYYY-MM-DD
export function formatDate(date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

// Helper function to handle API errors
export function handleApiError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API responded with error:', error.response.data);
    return error.response.data.message || 'API Error';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received from API:', error.request);
    return 'No response from server';
  } else {
    // Something happened in setting up the request that triggered an error
    console.error('Error setting up API call:', error.message);
    return 'Error making API call';
  }
}

// Helper to generate unique IDs
let idCounter = 0;
export function generateUniqueId() {
  idCounter += 1;
  return `id_${idCounter}_${Date.now()}`;
}

// Helper function to capitalize the first letter of a string
export function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}
