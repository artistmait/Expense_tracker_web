import {
  evaluateAndPersistRecommendations,
  getActiveRecommendations,
  dismissRecommendation
} from './advisorService.js';

export const getRecommendationsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    let recommendations = await getActiveRecommendations(userId);
    
    // If no recommendations exist yet, evaluate rules automatically
    if (recommendations.length === 0) {
      recommendations = await evaluateAndPersistRecommendations(userId);
    }

    return res.status(200).json({
      success: true,
      recommendations
    });
  } catch (err) {
    console.error('[AdvisorController getRecommendationsHandler Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve recommendations'
    });
  }
};

export const generateRecommendationsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendations = await evaluateAndPersistRecommendations(userId);

    return res.status(200).json({
      success: true,
      recommendations,
      count: recommendations.length,
      evaluatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('[AdvisorController generateRecommendationsHandler Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to evaluate recommendations'
    });
  }
};

export const dismissRecommendationHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const dismissed = await dismissRecommendation(userId, id);
    if (!dismissed) {
      return res.status(404).json({
        success: false,
        error: 'Recommendation not found or already dismissed'
      });
    }

    return res.status(200).json({
      success: true,
      dismissed
    });
  } catch (err) {
    console.error('[AdvisorController dismissRecommendationHandler Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to dismiss recommendation'
    });
  }
};
