import {  Table, Column, Model, DataType, HasMany, Default, Unique, AllowNull, ForeignKey, BelongsTo} from 'sequelize-typescript';
import User from './User';


@Table({
    tableName: 'medical_records'
})
class MedicalRecord extends Model {

    @Column({
        type: DataType.STRING(50)
    })
    declare description: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER
    })
    declare userId: number;
    
    // Relations
    @BelongsTo(() => User)
    declare user: User;
}

export default MedicalRecord