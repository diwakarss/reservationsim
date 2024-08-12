# Reservation Simulator

![Reservation Simulator](path_to_screenshot) <!-- Replace with an actual path to a screenshot of your app -->

## Introduction

The **Reservation Simulator** is a computational model designed to simulate the dynamics of a hierarchical society structured by rigid social classes. The simulation allows users to explore the societal impact of policies such as reservations or affirmative actions on different social strata. By leveraging real-world analogs, such as population distribution, fertility rates, education access, job access, wealth distribution, and social indicators, the simulator provides insights into the effects of various policy interventions in a controlled virtual environment.

## Features

- **Population Distribution**: Simulate the division of population across five distinct social classes.
- **Fertility Rate Distribution**: Analyze the varying fertility rates across different social classes.
- **Education Access**: Explore disparities in educational access and outcomes among social classes.
- **Job Access**: Simulate economic opportunities and employment rates for different social classes.
- **Wealth Distribution**: Visualize economic inequality across social classes.
- **Social Indicators**: Track health outcomes, crime rates, and trust in government for different social classes.

## Key Parameters

- **Population Distribution**: Reflects the division of the population into five social classes.
- **Fertility Rate**: Varies across social classes, influenced by socioeconomic status.
- **Education Access**: Enrollment and literacy rates differ significantly among classes.
- **Job Access**: Employment rates and job security vary by class.
- **Wealth Distribution**: A critical factor in understanding economic inequality.
- **Social Indicators**: Includes life expectancy, infant mortality rate, crime rates, and trust in government.

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

3. **Run the Development Server**

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

---