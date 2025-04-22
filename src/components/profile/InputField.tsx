import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Control } from "react-hook-form"

interface InputFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  control: Control<any>
  rules?: Record<string, any>
}

export function InputField({ 
  name, 
  label, 
  type = "text", 
  placeholder,
  control,
  rules 
}: InputFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              type={type}
              placeholder={placeholder}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
} 