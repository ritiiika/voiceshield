from app.database import engine, Base
from app.models.call import CallAnalysis


print("Creating VoiceShield database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully.")