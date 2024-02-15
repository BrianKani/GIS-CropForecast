#Date: 16TH feb 2024, 2:21 am
# Listening to Kerosone Looped for 1 hour, the code is not working
# The issue is with merging the data frames(Yield and Temparature. i Will look into it in the morning

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# Step 1: Read Temperature Data
def read_temperature_data(year):
    filename = f"LST_CSV{year}.csv"
    temperature_data = pd.read_csv(filename, delimiter=',') 
    return temperature_data

# Step 2: Read Yield Data
def read_yield_data():
    filename = "Yield.csv"
    yield_data = pd.read_csv(filename, sep='\t', index_col=0)
    return yield_data

# Step 3: Preprocess Data
def preprocess_data(temperature_data, yield_data):
    combined_data = pd.merge(temperature_data, yield_data, left_on='Year', right_index=True)
    
    # Normalize temperature and yield
    scaler = MinMaxScaler()
    combined_data[['Temperature', 'Area(1000 Ha)', 'Production(1000 Tons)', 'Yield(T/Ha)']] = scaler.fit_transform(combined_data[['Temperature', 'Area(1000 Ha)', 'Production(1000 Tons)', 'Yield(T/Ha)']])
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(combined_data[['Temperature']], combined_data['Yield(T/Ha)'], test_size=0.2, random_state=42)
    return X_train, X_test, y_train, y_test

# Step 4: Define Neural Network
def create_model():
    model = Sequential([
        Dense(64, activation='relu', input_shape=(1,)),
        Dense(64, activation='relu'),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    return model

# Step 5: Train the Neural Network
def train_model(X_train, y_train):
    model = create_model()
    model.fit(X_train, y_train, epochs=100, batch_size=32, validation_split=0.2, verbose=2)
    return model

# Step 6: Evaluate the Model
def evaluate_model(model, X_test, y_test):
    loss, mae = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test Mean Absolute Error: {mae}")

# Main function to orchestrate the workflow
def main():
    years = range(2013, 2021)  # Range from 2013 to 2020
    for year in years:
        temperature_data = read_temperature_data(year)
        yield_data = read_yield_data()
        X_train, X_test, y_train, y_test = preprocess_data(temperature_data, yield_data)
        model = train_model(X_train, y_train)
        evaluate_model(model, X_test, y_test)

if __name__ == "__main__":
    main()

