const PatientReport = require('../Models/PatientReport');
const Pet = require('../Models/Pet');
const { successResponse, errorResponse } = require('../helpers/successAndErrorResponse');

// POST /medical-records (doctor/admin)
module.exports.createRecord = async (req, res) => {
  try {
    const { pet_id, services, symptoms, medication, status, appointment_id } = req.body;
    if (!pet_id) return res.status(400).json(errorResponse(400, 'pet_id is required'));

    const pet = await Pet.findByPk(pet_id);
    if (!pet) return res.status(404).json(errorResponse(404, 'Pet not found'));

    const record = await PatientReport.create({
      pet_id,
      user_id: pet.user_id,
      services: services || '',
      symptoms: symptoms || '',
      medication: medication || '',
      status: status || 'active',
      doctor_id: req.user && req.user.user_type === 'doctor' ? req.user.user_id : null,
      appointment_id: appointment_id || null
    });

    res.status(201).json(successResponse(201, 'Medical record created', record));
  } catch (error) {
    console.error('CREATE MED RECORD ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create medical record', error.message));
  }
};

// PUT /medical-records/:id (doctor/admin)
module.exports.updateRecord = async (req, res) => {
  try {
    const rec = await PatientReport.findByPk(req.params.id);
    if (!rec) return res.status(404).json(errorResponse(404, 'Record not found'));

    const allowed = ['services','symptoms','medication','status','doctor_id','appointment_id'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    await rec.update(updates);

    res.status(200).json(successResponse(200, 'Medical record updated', rec));
  } catch (error) {
    console.error('UPDATE MED RECORD ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update medical record', error.message));
  }
};

// GET /medical-records/:id (doctor/admin)
module.exports.getRecordById = async (req, res) => {
  try {
    const rec = await PatientReport.findByPk(req.params.id);
    if (!rec) return res.status(404).json(errorResponse(404, 'Record not found'));

    res.status(200).json(successResponse(200, 'Fetched record', rec));
  } catch (error) {
    console.error('GET MED RECORD ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch medical record', error.message));
  }
};

// GET /pets/:id/medical-records (user) - list records for a pet, user must be owner or admin/doctor
module.exports.getRecordsForPet = async (req, res) => {
  try {
    const petId = req.params.id;
    const pet = await Pet.findByPk(petId);
    if (!pet) return res.status(404).json(errorResponse(404, 'Pet not found'));

    if (pet.user_id !== req.userId && !(req.user && ['admin','superadmin','doctor'].includes(req.user.user_type))) {
      return res.status(403).json(errorResponse(403, 'Forbidden'));
    }

    const records = await PatientReport.findAll({ where: { pet_id: petId }, order: [['report_id','DESC']]});
    res.status(200).json(successResponse(200, 'Fetched medical records', records));
  } catch (error) {
    console.error('GET PET RECORDS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch medical records', error.message));
  }
};