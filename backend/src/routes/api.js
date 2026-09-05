const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const businessController = require('../controllers/businessController');
const salesController = require('../controllers/salesController');
const expensesController = require('../controllers/expensesController');
const profileController = require('../controllers/profileController');
const itemsController = require('../controllers/itemsController');
const analysisController = require('../controllers/analysisController');
const contextController = require('../controllers/contextController');
const schemesController = require('../controllers/schemesController');
const chatController = require('../controllers/chatController');

// User routes
router.post('/users', userController.createUser);
router.get('/users/:userId', userController.getUser);

// Business routes (Section A)
router.post('/businesses/:userId', businessController.saveBusiness);
router.get('/businesses/:userId', businessController.getBusiness);

// Sales routes (Section B)
router.post('/sales/:userId', salesController.saveSales);
router.get('/sales/:userId', salesController.getSales);

// Expenses routes (Section C)
router.post('/expenses/:userId', expensesController.saveExpenses);
router.get('/expenses/:userId', expensesController.getExpenses);

// Profile routes (Sections D, E, F: customers, competition, problems)
router.post('/profile/:userId', profileController.saveProfile);
router.get('/profile/:userId', profileController.getProfile);

// Items routes
router.post('/items/:userId', itemsController.saveItems);
router.get('/items/:userId', itemsController.getItems);

// Financial Analysis route
router.get('/analysis/:userId', analysisController.getAnalysis);

// Government Schemes Matcher route
router.post('/schemes/compare', schemesController.compareSchemes);
router.get('/schemes/compare', schemesController.compareSchemes);
router.get('/schemes/:userId', schemesController.getMatchingSchemes);

// Hyper-local Context route
router.get('/local-context/:userId', contextController.getLocalContext);

// AI Chatbot Advisory route
router.post('/chat/:userId', chatController.handleChatMessage);

// Comprehensive user summary endpoint
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [userReq, bizReq, salesReq, expReq, profReq, itemsReq] = await Promise.all([
      userController.getUser({ params: { userId } }, { json: (d) => d, status: () => ({ json: (d) => d }) }),
      businessController.getBusiness({ params: { userId } }, { json: (d) => d, status: () => ({ json: (d) => d }) }),
      salesController.getSales({ params: { userId } }, { json: (d) => d, status: () => ({ json: (d) => d }) }),
      expensesController.getExpenses({ params: { userId } }, { json: (d) => d, status: () => ({ json: (d) => d }) }),
      profileController.getProfile({ params: { userId } }, { json: (d) => d, status: () => ({ json: (d) => d }) }),
      itemsController.getItems({ params: { userId } }, { json: (d) => d, status: () => ({ json: (d) => d }) }),
    ]);

    res.json({
      success: true,
      data: {
        user: userReq?.user || null,
        business: bizReq?.business || null,
        sales: salesReq?.sales || null,
        expenses: expReq?.expenses || null,
        profile: profReq?.profile || null,
        items: itemsReq?.items || [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch full summary', details: err.message });
  }
});

module.exports = router;
