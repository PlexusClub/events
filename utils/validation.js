const Joi = require('joi');

const eventSchema = Joi.object({
  name: Joi.string().max(100).required().messages({'string.empty': 'Event name is required'}),
  description: Joi.string().max(1000).required().messages({'string.empty': 'Event description is required'}),
  date: Joi.date().iso().required().messages({'date.base': 'Invalid date format'}),
  start_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({'string.pattern.base': 'Invalid start time format'}),
  end_time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({'string.pattern.base': 'Invalid end time format'}),
  location: Joi.string().max(200).required().messages({'string.empty': 'Location is required'}),
  organizer_name: Joi.string().max(100).required().messages({'string.empty': 'Organizer name is required'}),
  organizer_contact: Joi.string().max(50).required().messages({'string.empty': 'Organizer contact is required'}),
  category: Joi.string().max(50).required().messages({'string.empty': 'Category is required'}),
  capacity: Joi.number().integer().min(1).required().messages({'number.base': 'Capacity must be a number', 'number.min': 'Capacity must be at least 1'}),
  registration_fee: Joi.number().min(0).required().messages({'number.base': 'Registration fee must be a number', 'number.min': 'Registration fee cannot be negative'}),
  prerequisites: Joi.string().max(500).allow(''),
  additional_info: Joi.string().max(1000).allow(''),
  is_virtual: Joi.boolean().required().messages({'boolean.base': 'Is virtual must be true or false'}),
  virtual_link: Joi.string().uri().allow('').messages({'string.uri': 'Invalid virtual link format'}),
  image_url: Joi.string().uri().allow('').messages({'string.uri': 'Invalid image URL format'}),
  status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').required().messages({'any.only': 'Invalid status'})
});

const registrationSchema = Joi.object({
  eventId: Joi.number().integer().required().messages({'number.base': 'Event ID must be a number'}),
  userName: Joi.string().max(100).required().messages({'string.empty': 'User name is required'}),
  rollNo: Joi.string().pattern(/^[A-Z0-9]{10}$/).required().messages({'string.pattern.base': 'Invalid roll number format'}),
  mobileNo: Joi.string().pattern(/^[0-9]{10}$/).required().messages({'string.pattern.base': 'Mobile number must be 10 digits'}),
  email: Joi.string().email().required().messages({'string.email': 'Invalid email format'}),
  deptSection: Joi.string().max(50).required().messages({'string.empty': 'Department and section are required'})
});

function validateEvent(event) {
  return eventSchema.validate(event, { abortEarly: false });
}

function validateRegistration(registration) {
  return registrationSchema.validate(registration, { abortEarly: false });
}

module.exports = {
  validateEvent,
  validateRegistration
};