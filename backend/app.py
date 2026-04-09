from flask import Flask
from flask_cors import CORS
from config import config
from database import init_db
from routes import register_blueprints


def create_app(config_name='development'):
    app = Flask(__name__)
    
    app.config.from_object(config[config_name])
    
    CORS(app)
    
    init_db(app)
    
    register_blueprints(app)
    
    @app.route('/')
    def index():
        return 'Hello World from SQL Server!', 200
    
    return app


if __name__ == '__main__':
    app = create_app('development')
    app.run(debug=True)
