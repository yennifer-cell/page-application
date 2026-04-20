Wordly Dictionary SPA
A Single Page Application (SPA) that provides an interactive dictionary feature using the Free Dictionary API. Users can search for words, view definitions, pronunciations, synonyms, and save their favorite terms.

Features
Word Search: Search for any word and get comprehensive definitions
Audio Pronunciation: Listen to word pronunciations when available
Definitions & Examples: View multiple definitions with usage examples
Synonyms: Discover synonyms for words and quickly search them
Save Words: Save favorite words to localStorage for quick access
Theme Toggle: Switch between light and dark themes
Responsive Design: Works seamlessly on desktop and mobile devices
Error Handling: Graceful handling of invalid searches and API errors
Technologies Used
HTML5 (semantic markup with ARIA attributes)
CSS3 (CSS custom properties, flexbox, grid)
Vanilla JavaScript (ES6+)
Free Dictionary API
LocalStorage API
Ubuntu Font (Google Fonts)
How to Use
Open index.html in a web browser
Type a word in the search box
Click "Search" or press Enter
View definitions, phonetics, synonyms, and examples
Click "Play audio" to hear pronunciation (if available)
Click "Save word" to add to your saved words list
Click on any saved word or synonym tag to search it
Toggle theme using the "Toggle theme" button
API Reference
This project uses the Free Dictionary API

Endpoint: https://api.dictionaryapi.dev/api/v2/entries/en/{word}

Project Structure
wordly/
├── index.html    # Main HTML structure
├── style.css     # Styles and theme definitions
├── script.js     # Application logic and API integration
└── README.md     # Project documentation
Features Breakdown
Search Functionality
Form submission with validation
Loading states with user feedback
Edge case handling (empty input, special characters)
Data Display
Dynamic DOM updates
Part of speech categorization
Multiple definitions per word
Examples and synonyms
Source URLs
Event Handling
Form submission
Button clicks (play audio, save word, theme toggle)
Clickable synonym tags for quick searches
Saved word list interactions
DOM Manipulation
Dynamic content rendering
State-based UI updates
Accessibility features (ARIA labels, semantic HTML)
Error Handling
Network error handling
404 responses for invalid words
User-friendly error messages
Graceful fallbacks
Browser Compatibility
Works in all modern browsers that support:

ES6+ JavaScript
CSS Grid and Flexbox
Fetch API
LocalStorage
License
This project is created for educational purposes as part of the Moringa School curriculum.

Author
Janeffer

Acknowledgments
Free Dictionary API for providing the word data
Moringa School for the project requirements
