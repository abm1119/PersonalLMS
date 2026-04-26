import sys
import os

# Add the current directory to sys.path so that 'app' can be imported
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app
from mangum import Mangum

# Initialize the Mangum handler for Netlify Functions (AWS Lambda compatible)
handler = Mangum(app, lifespan="off")
