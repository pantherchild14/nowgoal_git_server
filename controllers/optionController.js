import { Options } from "../models/optionModel.js";


const findOptionByName = async (optionName) => {
    try {
        const option = await Options.findOne({ option_name: optionName });
        return option;
    } catch (error) {
        throw error;
    }
}

// Chức năng cập nhật theo option_name
const updateOptionByName = async (optionName, updatedData) => {
    try {
        const option = await Options.findOneAndUpdate(
            { option_name: optionName },
            { $set: updatedData },
            { new: true }
        );
        return option;
    } catch (error) {
        throw error;
    }
}

const createOrUpdateOption = async (optionData) => {
    const { option_name } = optionData;

    // Kiểm tra xem option_name đã tồn tại hay chưa
    const existingOption = await findOptionByName(option_name);

    if (existingOption) {
        // Nếu tồn tại, thì cập nhật
        const updatedOption = await updateOptionByName(option_name, optionData);
        return updatedOption;
    } else {
        // Nếu không tồn tại, thì tạo mới
        const newOption = await createOption(optionData);
        return newOption;
    }
};
// Chức năng xóa theo option_name
const deleteOptionByName = async (optionName) => {
    try {
        const result = await Options.deleteOne({ option_name: optionName });
        return result;
    } catch (error) {
        throw error;
    }
}

export { findOptionByName, createOrUpdateOption, deleteOptionByName };