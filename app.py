# app.py
from flask_migrate import Migrate
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
import random
import logging
import os
import json

# run following in console to generate requirements.txt in windows
# pipdeptree --warn silence | Select-String '^\S' > requirements.txt
# OR unix based
# pipdeptree --warn silence | grep -E '^\S' > requirements.txt

# create Heroku procfile on windows
# New-Item Procfile

# JawsDB free-tier DB on heroku
# https://www.youtube.com/watch?v=7IPPyXck5j0

# Load environment variables from .env (development or production)
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# set folder where static assets are stored
app.static_folder = 'static'

# Configure MySQL database

## Development (local machine)
#macOS
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/toy_interactions'
# windowss
# app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:@localhost/toy_interactions'

# Check if config.json exists
if os.path.isfile('config.json'):
    print('file exists')
# #     # Load development configuration from config.json if FLASK_ENV=development
    if os.getenv('FLASK_ENV', 'development') == 'development':
        print('development mode')
        with open('config.json', 'r') as config_file:
            try:
                config_data = json.load(config_file)
            except json.JSONDecodeError as e:
                print(f"Error loading JSON from config.json: {e}")
                config_data = {}  # Set default empty dictionary in case of error
        
#         # windows
        app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql://{config_data.get('development', {}).get('username', '')}:{config_data.get('development', {}).get('password', '')}@{config_data.get('development', {}).get('host', '')}/{config_data.get('development', {}).get('database', '')}"
#         # mac OS
#         # app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/toy_interactions'
        
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# #     # Load production configuration from config.json if FLASK_ENV=production
    elif os.getenv('FLASK_ENV') == 'production':
        print('production mode')
        with open('config.json', 'r') as config_file:
            try:
                config_data = json.load(config_file)
            except json.JSONDecodeError as e:
                print(f"Error loading JSON from config.json: {e}")
                config_data = {}  # Set default empty dictionary in case of error
        app.config['SQLALCHEMY_DATABASE_URI'] = config_data.get('production', {}).get('JAWSDB_MARIA_URL', '')
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Set this to False to suppress a warning

# If config.json doesn't exist, use JAWSDB_MARIA_URL
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('JAWSDB_MARIA_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  
# Set this to False to suppress a warning

# Initialize the SQLAlchemy extension
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child = db.Column(db.String(50), unique=True, nullable=False)
    combination = db.Column(db.String(100), nullable=False)
    condition1 = db.Column(db.String(20), nullable=False)
    toy1 = db.Column(db.String(20), nullable=False)
    condition2 = db.Column(db.String(20), nullable=False)
    toy2 = db.Column(db.String(20), nullable=False)
    response = db.Column(db.String(255), unique=True, default='not_lookit')
    

# Define the Interaction model
class Interaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    child = db.Column(db.String(50), nullable=False)
    part_name = db.Column(db.String(100), nullable=False)
    toy_name = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.String(50), nullable=False)
    current_status = db.Column(db.String(100), nullable=False)
    updated_status = db.Column(db.String(100), nullable=False)

# Add this line to ensure the tables are created
with app.app_context():
    db.create_all()

# Flask route to handle interactions
@app.route('/record_interaction', methods=['POST'])
def record_interaction():
    data = request.get_json()

    # Extract data from the request
    child = data.get('child')
    part_name = data.get('partName')
    toy_name = data.get('toyName')
    timestamp = data.get('timestamp')
    current_status = data.get('currentStatus')
    updated_status = data.get('updatedStatus')

    # Create a new entry in the Interaction table
    new_interaction = Interaction(
        child=child,
        part_name=part_name,
        toy_name=toy_name,
        timestamp=timestamp,
        current_status=current_status,
        updated_status=updated_status
    )

    db.session.add(new_interaction)
    db.session.commit()

    return jsonify({'message': 'Interaction recorded successfully'})

# Add this line to ensure the tables are created
with app.app_context():
    db.create_all()

COMBINATIONS = [
    ('Pedagogical', 'TubeToy', 'Accidental', 'BoxToy'), # Joseph Pedagogical, Lonnie Accidental
    ('Accidental', 'TubeToy', 'Pedagogical', 'BoxToy'), # Joseph Accidental, Lonnie Pedagogical
    ('Pedagogical', 'BoxToy', 'Accidental', 'TubeToy'), # Lonnie Pedagogical, Joseph Accidental
    ('Accidental', 'BoxToy', 'Pedagogical', 'TubeToy') # Lonnie Accidental, Lonnie Accidental
]

# BoxToy currently assigned to Experimenter 1 (Joseph)
# TubeToy currently assigned to Experimenter 2 (Lonnie)

def random_assignment():
    combination = random.choice(COMBINATIONS)
    condition1, toy1, condition2, toy2 = combination
    combination_string = f"{condition1}-{toy1}-{condition2}-{toy2}"
    return combination_string, condition1, toy1, condition2, toy2

# Flask route to handle the landing page
@app.route('/')
def experiment():
    child = request.args.get('child')

    if child is None:
        # Handle the case where child is not provided
        return jsonify({'error': 'child is required'}), 400

    user = User.query.filter_by(child=child).first()

    if not user:
        combination, condition1, toy1, condition2, toy2 = random_assignment()
        new_user = User(
            child=child,
            combination=combination,
            condition1=condition1,
            toy1=toy1,
            condition2=condition2,
            toy2=toy2
        )

        try:
            db.session.add(new_user)
            db.session.commit()
        except Exception as e:
            # Handle the case where there's an issue with committing the transaction
            db.session.rollback()
            return jsonify({'error': f'Error creating user: {str(e)}'}), 500

    else:
        combination = user.combination
        condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('landing_page.html', child=child, assigned_data=assigned_data)

# Routes for instructions_pedagogical and instructions_accidental
@app.route('/instructions_pedagogical')
def instructions_pedagogical():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('instructions_pedagogical.html', child=child, assigned_data=assigned_data)

@app.route('/instructions_accidental')
def instructions_accidental():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('instructions_accidental.html', child=child, assigned_data=assigned_data)

@app.route('/tubeToy')
def tubeToy():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('tubeToy.html', child=child, assigned_data=assigned_data)

@app.route('/boxToy')
def boxToy():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('boxToy.html', child=child, assigned_data=assigned_data)

@app.route('/learningBox')
def learningBox():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('learning_box.html', child=child, assigned_data=assigned_data)

@app.route('/learningTube')
def learningTube():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('learning_tube.html', child=child, assigned_data=assigned_data)



@app.route('/debrief')
def debrief():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('debrief.html', child=child, assigned_data=assigned_data)

# make assigned data available to app when needed by requesting from the db
@app.route('/get_assigned_data', methods=['GET'])
def get_assigned_data():
    child = request.args.get('child')  # Get child from request parameters
    user = User.query.filter_by(child=child).first()

    if user:
        combination = user.combination
        condition1, toy1, condition2, toy2 = combination.split('-')

        assigned_data = {
            'ConditionToy_order': combination,
            'condition1': condition1,
            'toy1': toy1,
            'condition2': condition2,
            'toy2': toy2
        }

        return jsonify(assigned_data)
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/directory_for_joseph_sanity')
def directory_for_joseph_sanity():
    child = request.args.get('child')
    user = User.query.filter_by(child=child).first()

    if not user:
        return redirect(url_for('experiment'))

    combination = user.combination
    condition1, toy1, condition2, toy2 = combination.split('-')

    assigned_data = {
        'ConditionToy_order': combination,
        'condition1': condition1,
        'toy1': toy1,
        'condition2': condition2,
        'toy2': toy2
    }

    return render_template('directory_for_joseph_sanity.html', child=child, assigned_data=assigned_data)

if __name__ == '__main__':
    app.run(debug=True)

# set up Flask-Migrate
migrate = Migrate(app, db)