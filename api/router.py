from fastapi import APIRouter
from functions.user.user_routes import user_routes
from functions.dashboard.Geral.geral_routes import geral_routes
from functions.dashboard.Assessoria.assessoria_routes import assessoria_routes
from functions.dashboard.Repasses.repasses_routes import repasses_routes
from services.relator.relator_routes import relator_routes
from utils.test_routes import test_routes

router = APIRouter()

router.include_router(test_routes)
public_routes = []
router.include_router(relator_routes)
router.include_router(user_routes)
router.include_router(geral_routes)
router.include_router(assessoria_routes)
router.include_router(repasses_routes)

