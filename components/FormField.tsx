import React from 'react'
import {Control, Controller, Field, FieldValues, Path,} from "react-hook-form"
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from "@/components/ui/form";

interface FormFieldProps<T extends FieldValues> {
  control  :Control<T>;
  name : Path<T>;
  label : string;
  placeholder? : string;
  type? : 'text'|'email'|'password'|'number'|'fiLe'
}

import { Input } from "@/components/ui/input"
const FormField = <T extends FieldValues>({control, name, label, placeholder, type = "text"}: FormFieldProps<T>) => {
  return (
    <Controller name={name} control={control} render={({field}) => (
      <FormItem>
        <FormLabel className='label'>{label}</FormLabel>
        <FormControl>
          <Input className="input" placeholder={placeholder} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}/>
  );
}

export default FormField
