"""
LSTM-based temporal forecasting for threat trends prediction.
"""

import logging
import numpy as np
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    logger.warning("PyTorch not available. Using statistical methods only.")
    TORCH_AVAILABLE = False


@dataclass
class ThreatSignal:
    timestamp: datetime
    signal_type: str
    value: float
    metadata: Dict


@dataclass
class ForecastResult:
    forecast_horizon: int
    predicted_values: np.ndarray
    confidence_intervals: Optional[np.ndarray]
    trend: str
    risk_level: str


class LSTMForecaster(nn.Module):
    def __init__(self, input_dim: int = 1, hidden_dim: int = 64, 
                 num_layers: int = 2, output_dim: int = 1):
        super(LSTMForecaster, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, 
                           batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_dim, output_dim)
        
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim)
        
        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(out[:, -1, :])
        
        return out


class ThreatForecaster:
    def __init__(self, sequence_length: int = 30, forecast_horizon: int = 7):
        self.sequence_length = sequence_length
        self.forecast_horizon = forecast_horizon
        
        if TORCH_AVAILABLE:
            self.model = LSTMForecaster(input_dim=1, hidden_dim=64, 
                                       num_layers=2, output_dim=1)
            self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
            self.criterion = nn.MSELoss()
            logger.info("LSTM forecaster initialized")
        else:
            self.model = None
            logger.info("Statistical forecaster initialized")
            
        # Storage for historical signals
        self.signals: Dict[str, List[ThreatSignal]] = {}
        
        # Normalization parameters
        self.mean = 0.0
        self.std = 1.0
        
    def add_signal(self, signal: ThreatSignal) -> None:
        if signal.signal_type not in self.signals:
            self.signals[signal.signal_type] = []
        self.signals[signal.signal_type].append(signal)
        
    def add_signals(self, signals: List[ThreatSignal]) -> None:
        for signal in signals:
            self.add_signal(signal)
            
    def prepare_sequences(self, signal_type: str) -> Tuple[np.ndarray, np.ndarray]:
        if signal_type not in self.signals or len(self.signals[signal_type]) < self.sequence_length + 1:
            raise ValueError(f"Not enough data for signal type: {signal_type}")
            
        sorted_signals = sorted(self.signals[signal_type], key=lambda s: s.timestamp)
        values = np.array([s.value for s in sorted_signals])
        
        self.mean = np.mean(values)
        self.std = np.std(values) + 1e-8
        values = (values - self.mean) / self.std
        
        X, y = [], []
        for i in range(len(values) - self.sequence_length):
            X.append(values[i:i + self.sequence_length])
            y.append(values[i + self.sequence_length])
            
        return np.array(X), np.array(y)
        
    def train(self, signal_type: str, epochs: int = 100) -> float:
        if not TORCH_AVAILABLE or self.model is None:
            logger.info("PyTorch not available, skipping training")
            return 0.0
            
        logger.info(f"Training forecaster on {signal_type}...")
        
        X, y = self.prepare_sequences(signal_type)
        X_tensor = torch.FloatTensor(X).unsqueeze(-1)
        y_tensor = torch.FloatTensor(y).unsqueeze(-1)
        
        self.model.train()
        for epoch in range(epochs):
            self.optimizer.zero_grad()
            
            predictions = self.model(X_tensor)
            loss = self.criterion(predictions, y_tensor)
            
            loss.backward()
            self.optimizer.step()
            
            if (epoch + 1) % 20 == 0:
                logger.debug(f"Epoch [{epoch+1}/{epochs}], Loss: {loss.item():.4f}")
                
        logger.info(f"Training complete. Final loss: {loss.item():.4f}")
        return loss.item()
        
    def forecast_lstm(self, signal_type: str) -> ForecastResult:
        if not TORCH_AVAILABLE or self.model is None:
            raise ValueError("LSTM model not available")
            
        sorted_signals = sorted(self.signals[signal_type], key=lambda s: s.timestamp)
        values = np.array([s.value for s in sorted_signals[-self.sequence_length:]])
        values = (values - self.mean) / self.std
        
        self.model.eval()
        predictions = []
        current_sequence = values.copy()
        
        with torch.no_grad():
            for _ in range(self.forecast_horizon):
                x = torch.FloatTensor(current_sequence).unsqueeze(0).unsqueeze(-1)
                pred = self.model(x).item()
                predictions.append(pred)
                current_sequence = np.append(current_sequence[1:], pred)
                
        predictions = np.array(predictions) * self.std + self.mean
        
        trend = self._analyze_trend(predictions)
        risk_level = self._assess_risk(predictions)
        
        return ForecastResult(
            forecast_horizon=self.forecast_horizon,
            predicted_values=predictions,
            confidence_intervals=None,
            trend=trend,
            risk_level=risk_level
        )
        
    def forecast_statistical(self, signal_type: str) -> ForecastResult:
        logger.info(f"Generating statistical forecast for {signal_type}...")
        
        sorted_signals = sorted(self.signals[signal_type], key=lambda s: s.timestamp)
        values = np.array([s.value for s in sorted_signals[-self.sequence_length:]])
        
        window_size = min(7, len(values))
        ma = np.mean(values[-window_size:])
        
        if len(values) >= 2:
            x = np.arange(len(values))
            coeffs = np.polyfit(x, values, 1)
            trend_slope = coeffs[0]
        else:
            trend_slope = 0
            
        predictions = []
        for i in range(self.forecast_horizon):
            pred = ma + trend_slope * (i + 1)
            predictions.append(pred)
            
        predictions = np.array(predictions)
        
        std = np.std(values)
        confidence_intervals = np.array([
            [pred - 1.96 * std, pred + 1.96 * std] 
            for pred in predictions
        ])
        
        trend = self._analyze_trend(predictions)
        risk_level = self._assess_risk(predictions)
        
        return ForecastResult(
            forecast_horizon=self.forecast_horizon,
            predicted_values=predictions,
            confidence_intervals=confidence_intervals,
            trend=trend,
            risk_level=risk_level
        )
        
    def forecast(self, signal_type: str, method: str = 'auto') -> ForecastResult:
        if signal_type not in self.signals:
            raise ValueError(f"No data available for signal type: {signal_type}")
            
        if method == 'auto':
            method = 'lstm' if TORCH_AVAILABLE and self.model is not None else 'statistical'
            
        logger.info(f"Forecasting {signal_type} using {method} method...")
        
        if method == 'lstm':
            return self.forecast_lstm(signal_type)
        else:
            return self.forecast_statistical(signal_type)
            
    def _analyze_trend(self, predictions: np.ndarray) -> str:
        if len(predictions) < 2:
            return 'stable'
            
        x = np.arange(len(predictions))
        coeffs = np.polyfit(x, predictions, 1)
        slope = coeffs[0]
        
        threshold = 0.01 * np.mean(np.abs(predictions))
        
        if slope > threshold:
            return 'increasing'
        elif slope < -threshold:
            return 'decreasing'
        else:
            return 'stable'
            
    def _assess_risk(self, predictions: np.ndarray) -> str:
        max_pred = np.max(predictions)
        
        if max_pred < 0.3:
            return 'low'
        elif max_pred < 0.6:
            return 'medium'
        elif max_pred < 0.85:
            return 'high'
        else:
            return 'critical'


def generate_demo_signals(days: int = 60) -> List[ThreatSignal]:
    signals = []
    base_date = datetime.now() - timedelta(days=days)
    
    for i in range(days):
        date = base_date + timedelta(days=i)
        
        trend = 0.3 + (i / days) * 0.4
        day_of_week = date.weekday()
        seasonality = 0.1 * np.sin(2 * np.pi * day_of_week / 7)
        noise = np.random.normal(0, 0.05)
        spike = 0.2 if np.random.random() < 0.1 else 0.0
        
        value = trend + seasonality + noise + spike
        value = max(0.0, min(1.0, value))
        
        signals.append(ThreatSignal(
            timestamp=date,
            signal_type='attack_volume',
            value=value,
            metadata={'source': 'demo'}
        ))
        
    return signals


if __name__ == "__main__":
    print("=" * 80)
    print("Temporal Forecasting - Threat Trend Prediction")
    print("=" * 80)
    print()
    
    # Initialize forecaster
    print("Initializing threat forecaster...")
    forecaster = ThreatForecaster(sequence_length=30, forecast_horizon=14)
    print("   Forecaster ready")
    print()
    
    # Generate demo data
    print("Generating historical threat signals (60 days)...")
    signals = generate_demo_signals(days=60)
    forecaster.add_signals(signals)
    print(f"   Added {len(signals)} historical signals")
    print()
    
    # Train model if available
    if TORCH_AVAILABLE:
        print("Training LSTM model...")
        loss = forecaster.train('attack_volume', epochs=50)
        print(f"   Training complete (loss: {loss:.4f})")
        print()
    
    # Generate forecast
    print("Generating 14-day threat forecast...")
    result = forecaster.forecast('attack_volume')
    print(f"   Forecast generated")
    print()
    
    # Display results
    print(f"{'=' * 80}")
    print("Forecast Results")
    print(f"{'=' * 80}")
    print(f"Forecast Horizon: {result.forecast_horizon} days")
    print(f"Trend: {result.trend.upper()}")
    print(f"Risk Level: {result.risk_level.upper()}")
    print()
    
    print("Predicted Values (next 14 days):")
    for i, value in enumerate(result.predicted_values, 1):
        bar_length = int(value * 50)
        bar = '█' * bar_length
        print(f"  Day {i:2d}: {value:.3f} {bar}")
        
    print()
    
    # Summary statistics
    print("Summary Statistics:")
    print(f"  Mean predicted value: {np.mean(result.predicted_values):.3f}")
    print(f"  Max predicted value: {np.max(result.predicted_values):.3f}")
    print(f"  Min predicted value: {np.min(result.predicted_values):.3f}")
    print(f"  Std deviation: {np.std(result.predicted_values):.3f}")
    print()
    
    print("Threat forecasting complete!")
    print("=" * 80)
