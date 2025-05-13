# Flash Cards Application

A mobile-friendly Angular application for learning Spanish phrases using flash cards. The application allows users to create, import, and study flash cards with English-Spanish translations.

## Features

- Create individual flash cards with English and Spanish phrases
- Import flash cards from CSV files
- Study mode with spaced repetition
- Example generation using OpenAI API
- Mobile-friendly interface
- Local storage using IndexedDB
- Progress tracking for each flash card

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd flash-cards
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## Usage

1. When you first open the application, you'll be prompted to enter your OpenAI API key. This key is stored locally and is used to generate example sentences for the flash cards.

2. You can add flash cards in two ways:

   - Use the "Add Phrase" page to create individual cards
   - Use the "Upload CSV" page to import multiple cards from a CSV file

3. The CSV file should have the following format:

```
English phrase,Spanish phrase
Hello,Hola
Good morning,Buenos días
```

4. Use the "Study" page to review your flash cards. The application will show you English phrases and ask you to recall their Spanish translations.

5. For each card, you can:
   - Click "Show Answer" to see the Spanish translation
   - Click "I Know" if you remembered correctly
   - Click "I Don't Know" if you need more practice

## Development

The application is built with:

- Angular 17
- TypeScript
- Angular Material
- IndexedDB for local storage
- OpenAI API for example generation

## License

This project is licensed under the MIT License.
