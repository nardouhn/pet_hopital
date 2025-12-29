const Services = require('../Models/Service');
const Medication = require('../Models/Medication');
const { successResponse, errorResponse } = require('../helpers/successAndErrorResponse');

// Public: GET /services
module.exports.getServices = async (req, res) => {
  try {
    const services = await Services.findAll({ order: [['service_id','ASC']] });
    res.status(200).json(successResponse(200, 'Fetched services', services));
  } catch (error) {
    console.error('GET SERVICES ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch services', error.message));
  }
};

// Public: GET /medicines
module.exports.getMedicines = async (req, res) => {
  try {
    const meds = await Medication.findAll({ order: [['medicine_id','ASC']] });
    res.status(200).json(successResponse(200, 'Fetched medicines', meds));
  } catch (error) {
    console.error('GET MEDICINES ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch medicines', error.message));
  }
};

/* ===== Admin: services ===== */
module.exports.createService = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name) return res.status(400).json(errorResponse(400, 'Name is required'));
    const s = await Services.create({ name, price });
    res.status(201).json(successResponse(201, 'Service created', s));
  } catch (error) {
    console.error('CREATE SERVICE ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create service', error.message));
  }
};

module.exports.updateService = async (req, res) => {
  try {
    const s = await Services.findByPk(req.params.id);
    if (!s) return res.status(404).json(errorResponse(404, 'Service not found'));
    const { name, price } = req.body;
    await s.update({ name: name || s.name, price: price || s.price });
    res.status(200).json(successResponse(200, 'Service updated', s));
  } catch (error) {
    console.error('UPDATE SERVICE ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update service', error.message));
  }
};

module.exports.deleteService = async (req, res) => {
  try {
    const s = await Services.findByPk(req.params.id);
    if (!s) return res.status(404).json(errorResponse(404, 'Service not found'));
    await s.destroy();
    res.status(200).json(successResponse(200, 'Service deleted'));
  } catch (error) {
    console.error('DELETE SERVICE ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to delete service', error.message));
  }
};

/* ===== Admin: medicines ===== */
module.exports.createMedicine = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    if (!name) return res.status(400).json(errorResponse(400, 'Name is required'));
    const m = await Medication.create({ name, quantity: quantity || 0, price: price || 0 });
    res.status(201).json(successResponse(201, 'Medicine created', m));
  } catch (error) {
    console.error('CREATE MED ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create medicine', error.message));
  }
};

module.exports.updateMedicine = async (req, res) => {
  try {
    const m = await Medication.findByPk(req.params.id);
    if (!m) return res.status(404).json(errorResponse(404, 'Medicine not found'));
    const { name, quantity, price } = req.body;
    await m.update({ name: name || m.name, quantity: quantity || m.quantity, price: price || m.price });
    res.status(200).json(successResponse(200, 'Medicine updated', m));
  } catch (error) {
    console.error('UPDATE MED ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update medicine', error.message));
  }
};

module.exports.deleteMedicine = async (req, res) => {
  try {
    const m = await Medication.findByPk(req.params.id);
    if (!m) return res.status(404).json(errorResponse(404, 'Medicine not found'));
    await m.destroy();
    res.status(200).json(successResponse(200, 'Medicine deleted'));
  } catch (error) {
    console.error('DELETE MED ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to delete medicine', error.message));
  }
};