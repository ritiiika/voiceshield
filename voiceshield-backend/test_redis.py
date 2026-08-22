from app.redis_client import save_previous_risk, get_previous_risk

print("Testing Redis risk memory...")

save_previous_risk("TEST-CALLER", 85)

risk = get_previous_risk("TEST-CALLER")

print("Previous risk:", risk)

if risk == 85:
    print("Redis risk memory working!")
else:
    print("Redis risk memory FAILED!")