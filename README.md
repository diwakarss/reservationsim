# Reservation Simulator

![Reservation Simulator](/reservation-simulator.png)

## Introduction

The **Reservation Simulator** is a computational model designed to simulate the dynamics of a hierarchical society structured by rigid social classes. The simulation allows users to explore the societal impact of policies such as reservations or affirmative actions on different social strata. By leveraging real-world analogs, such as population distribution, fertility rates, education access, job access, wealth distribution, and social indicators, the simulator provides insights into the effects of various policy interventions in a controlled virtual environment.

## Features

- **Population Distribution**: Simulate the division of population across five distinct social classes.
- **Fertility Rate Distribution**: Analyze the varying fertility rates across different social classes.
- **Education Access**: Explore disparities in educational access and outcomes among social classes.
- **Job Access**: Simulate economic opportunities and employment rates for different social classes.
- **Wealth Distribution**: Visualize economic inequality across social classes.
- **Social Indicators**: Track health outcomes, crime rates, and trust in government for different social classes.
- **AI-Powered Name and Description Generation**: The simulator uses OpenAI's API to generate names and descriptions dynamically.

## Prerequisites

Before running the project, ensure you have the following installed:

- **Node.js**: [Download and install Node.js](https://nodejs.org/)
- **OpenAI API Key**: Sign up for an API key at [OpenAI](https://beta.openai.com/signup/).

## Installation

To run the Reservation Simulator locally, follow these steps:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/reservation-simulator.git
   cd reservation-simulator
   ```

2. **Install Dependencies**

   The project uses Node.js and Next.js. Ensure you have Node.js installed on your machine. Then run:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   The project requires an OpenAI API key to generate names and descriptions. Create a `.env` file in the root directory of the project:

   ```bash
   touch .env
   ```

   Add your OpenAI API key to the `.env` file:

   ```plaintext
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

4. **Run the Development Server**

   Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the application in action.

## Usage

1. **World Generator**: Randomly generate or customize the planet name, country name, and population size.
2. **Innate Trait**: Generate and display an innate trait that influences the social classes.
3. **Social Classes**: Visualize the different social classes and their associated descriptions.
4. **Start Simulation**: Begin the simulation to calculate major metrics such as fertility rates, education access, job access, wealth distribution, and social indicators.
5. **View Stats**: Click on the "View Stats" button to display detailed statistics about the simulation.

## Project Structure

- **`components/`**: Contains reusable UI components.
- **`lib/`**: Includes functions for generating names, traits, and descriptions.
- **`config/initialParameters.ts`**: Defines the initial parameters for the simulation, including population distribution, fertility rates, education access, job access, wealth distribution, and social indicators.
- **`pages/`**: Next.js pages for rendering the UI.
- **`.env`**: Contains environment variables like the OpenAI API key.

## Data Sources

The simulation uses data from authoritative sources, including:

- **Population Data**: Census records, demographic surveys, UN Population Division reports.
- **Fertility and Health Data**: WHO databases, national health department records.
- **Education Data**: UNESCO Institute for Statistics.
- **Employment Data**: International Labour Organization (ILO) reports.
- **Wealth and Economic Data**: World Bank reports.
- **Social Indicators**: WHO Global Health Observatory, UNODC crime statistics.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request with your improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

- The **Reservation Simulator** draws inspiration from various real-world datasets and sociological studies.
- Special thanks to the contributors and the open-source community for their valuable input.
- This project utilizes the [OpenAI API](https://openai.com/api/) for generating dynamic content.

---