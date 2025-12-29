const Pet = require('../Models/Pet');
const { successResponse, errorResponse } = require('../helpers/successAndErrorResponse');

// POST /pets - create a pet for the authenticated user
module.exports.createPet = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, breed, gender, age, weight, color } = req.body;

    if (!name) return res.status(400).json(errorResponse(400, 'Name is required'));

    const pet = await Pet.create({
      name,
      breed: breed || '',
      gender: gender || 'unknown',
      age: age || null,
      weight: weight || null,
      color: color || '',
      user_id: userId
    });

    res.status(201).json(successResponse(201, 'Pet created successfully', pet));
  } catch (error) {
    console.error('CREATE PET ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to create pet', error.message));
  }
};

// GET /pets - list pets for authenticated user
module.exports.getPetsForUser = async (req, res) => {
  try {
    const userId = req.userId;
    const pets = await Pet.findAll({ where: { user_id: userId } });
    res.status(200).json(successResponse(200, 'Fetched pets', pets));
  } catch (error) {
    console.error('GET PETS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch pets', error.message));
  }
};

// GET /pets/:id - get pet by id (owner or admin)
module.exports.getPetById = async (req, res) => {
  try {
    const id = req.params.id;
    const pet = await Pet.findByPk(id);
    if (!pet) return res.status(404).json(errorResponse(404, 'Pet not found'));

    // If owner, allow; if requester is admin, allow; else deny
    if (pet.user_id !== req.userId && !(req.user && ['admin','superadmin'].includes(req.user.user_type))) {
      return res.status(403).json(errorResponse(403, 'Forbidden'));
    }

    res.status(200).json(successResponse(200, 'Fetched pet', pet));
  } catch (error) {
    console.error('GET PET BY ID ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch pet', error.message));
  }
};

// PUT /pets/:id - update pet (owner or admin)
module.exports.updatePet = async (req, res) => {
  try {
    const id = req.params.id;
    const pet = await Pet.findByPk(id);
    if (!pet) return res.status(404).json(errorResponse(404, 'Pet not found'));

    if (pet.user_id !== req.userId && !(req.user && ['admin','superadmin'].includes(req.user.user_type))) {
      return res.status(403).json(errorResponse(403, 'Forbidden'));
    }

    const updates = {};
    ['name','breed','gender','age','weight','color'].forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    await pet.update(updates);
    res.status(200).json(successResponse(200, 'Pet updated', pet));
  } catch (error) {
    console.error('UPDATE PET ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to update pet', error.message));
  }
};

// DELETE /pets/:id - delete pet (owner or admin)
module.exports.deletePet = async (req, res) => {
  try {
    const id = req.params.id;
    const pet = await Pet.findByPk(id);
    if (!pet) return res.status(404).json(errorResponse(404, 'Pet not found'));

    if (pet.user_id !== req.userId && !(req.user && ['admin','superadmin'].includes(req.user.user_type))) {
      return res.status(403).json(errorResponse(403, 'Forbidden'));
    }

    await pet.destroy();
    res.status(200).json(successResponse(200, 'Pet deleted'));
  } catch (error) {
    console.error('DELETE PET ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to delete pet', error.message));
  }
};

/* ===== Admin endpoints ===== */

// GET /admin/pets - all pets (admin only)
module.exports.adminGetAllPets = async (req, res) => {
  try {
    const pets = await Pet.findAll();
    res.status(200).json(successResponse(200, 'Fetched all pets', pets));
  } catch (error) {
    console.error('ADMIN GET PETS ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch pets', error.message));
  }
};

// GET /admin/pets/:id - get pet by id (admin)
module.exports.adminGetPetById = async (req, res) => {
  try {
    const pet = await Pet.findByPk(req.params.id);
    if (!pet) return res.status(404).json(errorResponse(404, 'Pet not found'));
    res.status(200).json(successResponse(200, 'Fetched pet', pet));
  } catch (error) {
    console.error('ADMIN GET PET BY ID ERROR:', error);
    res.status(500).json(errorResponse(500, 'Failed to fetch pet', error.message));
  }
};