import os

class Config:
    SQLALCHEMY_TRACK_MODIFICATIONS = False


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = (
        "mssql+pyodbc://SHENIZ\\SQLEXPRESS01/GDBPZNData"
        "?driver=ODBC+Driver+18+for+SQL+Server"
        "&trusted_connection=yes"
        "&Encrypt=no"
        "&TrustServerCertificate=yes"
    )


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URI',
        "mssql+pyodbc://SHENIZ\\SQLEXPRESS01/GDBPZNData"
        "?driver=ODBC+Driver+18+for+SQL+Server"
        "&trusted_connection=yes"
        "&Encrypt=no"
        "&TrustServerCertificate=yes"
    )


config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
